"use client";

import Link from "next/link";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowLeft, Scale, Sparkles, Trash2 } from "lucide-react";
import CompareMatrix from "@/components/compare/CompareMatrix";
import { useCompareList } from "@/hooks/useCompareList";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";

export default function ProductsComparePage() {
  const { compareList, removeProduct, clearAll, updateList } = useCompareList();

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId !== "comparison-zone" || destination.droppableId !== "comparison-zone") return;

    const items = Array.from(compareList);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);
    updateList(items);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: "100%", overflowX: "hidden" }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <Link
                href="/products"
                className="btn btn-ghost btn-sm"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10, padding: "4px 8px" }}
              >
                <ArrowLeft size={14} /> Back to Products
              </Link>
              <h2 className="heading-2" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <Scale size={22} style={{ color: "var(--primary)" }} />
                Product Compare
              </h2>
              <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
                Review selected products side-by-side with live pricing, ratings, and specs.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div className="badge badge-pro" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> {compareList.length}/{MAX_COMPARE_ITEMS} in compare tray
              </div>
              {compareList.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <Trash2 size={14} /> Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {compareList.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⚔️</div>
            <h3 style={{ margin: "0 0 8px", color: "var(--text-primary)", fontWeight: 700 }}>No products to compare yet</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13 }}>
              Go to the products page and click <strong>Compare</strong> on up to {MAX_COMPARE_ITEMS} items.
            </p>
            <Link href="/products" className="btn btn-primary" style={{ textDecoration: "none" }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="card" style={{ padding: 20, border: "2px dashed var(--primary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Smart Compare Zone</h3>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>
                    Drag items to reorder. Remove any product or add more from the products page.
                  </p>
                </div>
                <Link href="/products" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
                  Add More Products
                </Link>
              </div>

              <Droppable droppableId="comparison-zone" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 12,
                      minHeight: 110,
                      background: snapshot.isDraggingOver ? "rgba(107, 51, 246, 0.04)" : "transparent",
                      padding: 8,
                      borderRadius: 8,
                    }}
                  >
                    {compareList.map((product, index) => (
                      <Draggable key={`compare-${product.id}`} draggableId={`compare-${product.id}`} index={index}>
                        {(dragProvided, snapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="card"
                            style={{
                              padding: 10,
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              background: snapshot.isDragging ? "var(--primary-light)" : "var(--bg-surface-2)",
                              border: "1px solid var(--border)",
                              textAlign: "center",
                              cursor: "grab",
                              ...dragProvided.draggableProps.style,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => removeProduct(product.id)}
                              style={{
                                position: "absolute",
                                top: 4,
                                right: 4,
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "var(--danger)",
                                border: "none",
                                borderRadius: "50%",
                                width: 18,
                                height: 18,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                fontSize: 10,
                              }}
                              aria-label={`Remove ${product.title}`}
                            >
                              ×
                            </button>
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6, marginBottom: 6 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 48,
                                  height: 48,
                                  borderRadius: 6,
                                  background: "var(--bg-surface)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginBottom: 6,
                                }}
                              >
                                📦
                              </div>
                            )}
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                width: "100%",
                              }}
                            >
                              {product.title}
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>{product.bestPrice}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {Array.from({ length: Math.max(0, MAX_COMPARE_ITEMS - compareList.length) }).map((_, index) => (
                      <div
                        key={`placeholder-${index}`}
                        style={{
                          height: 104,
                          borderRadius: 8,
                          border: "2px dashed var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--text-muted)",
                          fontSize: 11,
                        }}
                      >
                        Slot open
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <CompareMatrix compareList={compareList} />
          </>
        )}
      </div>
    </DragDropContext>
  );
}
