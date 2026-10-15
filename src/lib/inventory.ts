import { prisma } from "@/lib/prisma";

export interface StockAlert {
  ingredientId: number;
  ingredientName: string;
  unit: string;
  currentStock: number;
  minStock: number;
  isOutOfStock: boolean;
  affectedMenus: { id: number; name: string }[];
}

/**
 * Deduct inventory ingredients based on recipes (Bill of Materials) for a given order.
 */
export async function deductInventoryForOrder(
  orderId: number,
  executorName: string = "Sistem BOM Otomatis"
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menu: {
              include: {
                recipes: {
                  include: {
                    ingredient: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order || !order.items || order.items.length === 0) {
      return { success: false, message: "Pesanan tidak ditemukan atau tidak memiliki item." };
    }

    const deductedDetails: string[] = [];
    const criticalAlerts: string[] = [];

    for (const item of order.items) {
      const recipes = item.menu?.recipes || [];
      for (const recipe of recipes) {
        const totalDeduct = recipe.quantityNeeded * item.quantity;
        const currentStock = recipe.ingredient.stockQuantity;
        const newStock = Math.max(0, currentStock - totalDeduct);

        // Update ingredient stock
        await prisma.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            stockQuantity: newStock,
          },
        });

        deductedDetails.push(
          `${recipe.ingredient.name}: -${totalDeduct} ${recipe.ingredient.unit} (Sisa: ${newStock})`
        );

        // Check if stock became critical
        if (newStock <= 0) {
          criticalAlerts.push(
            `[HABIS] Bahan ${recipe.ingredient.name} telah HABIS (0 ${recipe.ingredient.unit})!`
          );
        } else if (newStock <= recipe.ingredient.minStock) {
          criticalAlerts.push(
            `[KRITIS] Bahan ${recipe.ingredient.name} tersisa ${newStock} ${recipe.ingredient.unit} (Di bawah batas min: ${recipe.ingredient.minStock})`
          );
        }
      }
    }

    // Record audit log for inventory movement
    if (deductedDetails.length > 0) {
      await prisma.auditLog.create({
        data: {
          user: executorName,
          action: "BOM_AUTO_DEDUCT",
          details: `Pengurangan bahan baku resep untuk Pesanan #${order.orderNumber}: ${deductedDetails.join(
            ", "
          )}`,
        },
      });
    }

    // Record separate high-priority alert in audit log if any ingredient is critical
    if (criticalAlerts.length > 0) {
      await prisma.auditLog.create({
        data: {
          user: "Sistem Peringatan Dini",
          action: "LOW_STOCK_WARNING",
          details: `Peringatan Stok Kritis terdeteksi: ${criticalAlerts.join("; ")}`,
        },
      });
    }

    return {
      success: true,
      deductedCount: deductedDetails.length,
      alerts: criticalAlerts,
    };
  } catch (error: any) {
    console.error("Error deducting BOM inventory:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all ingredients and menus that currently have low or depleted stock.
 */
export async function getInventoryStockAlerts(): Promise<{
  lowStockItems: StockAlert[];
  outOfStockItems: StockAlert[];
  affectedMenuIds: number[];
}> {
  try {
    const allIngredients = await prisma.ingredient.findMany({
      include: {
        recipes: {
          include: {
            menu: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const lowStockItems: StockAlert[] = [];
    const outOfStockItems: StockAlert[] = [];
    const affectedMenuIdsSet = new Set<number>();

    for (const ing of allIngredients) {
      const isOut = ing.stockQuantity <= 0;
      const isLow = ing.stockQuantity <= ing.minStock;

      if (isLow || isOut) {
        const affectedMenus = ing.recipes.map((r) => ({
          id: r.menu.id,
          name: r.menu.name,
        }));

        affectedMenus.forEach((m) => affectedMenuIdsSet.add(m.id));

        const alertItem: StockAlert = {
          ingredientId: ing.id,
          ingredientName: ing.name,
          unit: ing.unit,
          currentStock: ing.stockQuantity,
          minStock: ing.minStock,
          isOutOfStock: isOut,
          affectedMenus,
        };

        if (isOut) {
          outOfStockItems.push(alertItem);
        } else {
          lowStockItems.push(alertItem);
        }
      }
    }

    return {
      lowStockItems,
      outOfStockItems,
      affectedMenuIds: Array.from(affectedMenuIdsSet),
    };
  } catch (error: any) {
    console.error("Error retrieving inventory alerts:", error);
    return { lowStockItems: [], outOfStockItems: [], affectedMenuIds: [] };
  }
}
