"use client";

import { useRef, useEffect, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Transformer } from "react-konva";
import type Konva from "konva";
import { useCanvasStore } from "@/store/canvasStore";

const STAGE_WIDTH = 900;
const STAGE_HEIGHT = 600;
const ANCHOR_SIZE = 9;
const ROTATE_ANCHOR_SIZE = 20;

// Inline SVG rotate-arrow icon, used both as the handle's icon and as the
// custom cursor while hovering it.
const ROTATE_ICON_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 11-3.7-7.3'/%3E%3Cpolyline points='21 3 21 9 15 9'/%3E%3C/svg%3E";
const ROTATE_CURSOR = `url("${ROTATE_ICON_SRC}") 12 12, pointer`;

interface CanvasStageProps {
  onExportReady: (exportFn: () => string) => void;
}

interface EditingText {
  id: string;
  value: string;
  top: number;
  left: number;
  width: number;
  fontSize: number;
  rotation: number;
  fill: string;
}

export function CanvasStage({ onExportReady }: CanvasStageProps) {
  const elements = useCanvasStore((state) => state.elements);
  const selectedId = useCanvasStore((state) => state.selectedId);
  const selectElement = useCanvasStore((state) => state.selectElement);
  const updateElement = useCanvasStore((state) => state.updateElement);

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const shapeRefs = useRef<Record<string, Konva.Node | null>>({});

  const [rotateIcon, setRotateIcon] = useState<HTMLImageElement | null>(null);
  const [editingText, setEditingText] = useState<EditingText | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = ROTATE_ICON_SRC;
    img.onload = () => setRotateIcon(img);
  }, []);

    useEffect(() => {
    onExportReady(() => {
      const transformer = transformerRef.current;
      const wasVisible = transformer?.visible() ?? false;

      // Hide the Transformer directly on the Konva node and force an immediate
      // redraw — going through selectElement(null) instead would only take
      // effect after React's next render, which is too late for a synchronous
      // toDataURL() call right after.
      transformer?.hide();
      transformer?.getLayer()?.batchDraw();

      const dataUrl = stageRef.current?.toDataURL({ pixelRatio: 2 }) ?? "";

      if (wasVisible) {
        transformer?.show();
        transformer?.getLayer()?.batchDraw();
      }

      // Also clear the selection in the store so the Properties/Layers panels
      // reflect "nothing selected" after an export, matching the old behavior.
      selectElement(null);

      return dataUrl;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const node = selectedId ? shapeRefs.current[selectedId] : null;
    transformer.nodes(node ? [node] : []);
    transformer.getLayer()?.batchDraw();
  }, [selectedId, elements.length]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  const handleTransformEnd = (id: string, node: Konva.Node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const el = elements.find((e) => e.id === id);
    if (!el) return;

    const changes: Record<string, number> = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (el.type === "rect") {
      changes.width = Math.max(5, (el.width ?? 0) * scaleX);
      changes.height = Math.max(5, (el.height ?? 0) * scaleY);
    } else if (el.type === "circle") {
      changes.radius = Math.max(5, (el.radius ?? 0) * ((scaleX + scaleY) / 2));
    } else if (el.type === "text") {
      const avgScale = (scaleX + scaleY) / 2;
      changes.fontSize = Math.max(6, Math.round((el.fontSize ?? 24) * avgScale));
    }

    node.scaleX(1);
    node.scaleY(1);

    updateElement(id, changes);
  };

  // Enter inline-edit mode: hide the Konva text node + transformer, and
  // overlay a real <textarea> positioned exactly on top of it.
  function startEditingText(id: string) {
    const node = shapeRefs.current[id] as Konva.Text | undefined;
    const stageContainer = stageRef.current?.container();
    if (!node || !stageContainer) return;

    const pos = node.absolutePosition();

    setEditingText({
      id,
      value: node.text(),
      top: stageContainer.offsetTop + pos.y,
      left: stageContainer.offsetLeft + pos.x,
      width: Math.max(node.width(), 60) + 20,
      fontSize: node.fontSize(),
      rotation: node.rotation(),
      fill: (node.fill() as string) || "#111827",
    });

    node.hide();
    transformerRef.current?.hide();
    node.getLayer()?.batchDraw();
  }

  function commitEditingText(cancel = false) {
    if (!editingText) return;
    const node = shapeRefs.current[editingText.id];

    if (!cancel) {
      updateElement(editingText.id, { text: editingText.value });
    }

    node?.show();
    if (selectedId === editingText.id) transformerRef.current?.show();
    node?.getLayer()?.batchDraw();
    setEditingText(null);
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-auto bg-zinc-950 p-8">
      <Stage
        ref={stageRef}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseDown={handleStageClick}
        className="rounded-xl bg-white shadow-2xl shadow-black/50"
      >
        <Layer>
          {[...elements]
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((el) => {
                            const commonProps = {
                id: el.id,
                x: el.x,
                y: el.y,
                rotation: el.rotation,
                fill: el.fill,
                draggable: true,
                ref: (node: Konva.Node | null) => {
                  shapeRefs.current[el.id] = node;
                },
                onClick: () => selectElement(el.id),
                onTap: () => selectElement(el.id),
                onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
                  updateElement(el.id, { x: e.target.x(), y: e.target.y() }),
                onTransformEnd: (e: Konva.KonvaEventObject<Event>) =>
                  handleTransformEnd(el.id, e.target),
              };

              if (el.type === "rect") {
                return (
                  <Rect
                    key={el.id}
                    {...commonProps}
                    width={el.width ?? 100}
                    height={el.height ?? 80}
                  />
                );
              }
              if (el.type === "circle") {
                return <Circle key={el.id} {...commonProps} radius={el.radius ?? 50} />;
              }
              return (
                <Text
                  key={el.id}
                  {...commonProps}
                  text={el.text ?? "Text"}
                  fontSize={el.fontSize ?? 24}
                  onDblClick={() => startEditingText(el.id)}
                  onDblTap={() => startEditingText(el.id)}
                />
              );
            })}

          <Transformer
            ref={transformerRef}
            rotateEnabled
            anchorSize={ANCHOR_SIZE}
            anchorStroke="#6366f1"
            anchorStrokeWidth={1.5}
            anchorFill="#ffffff"
            anchorCornerRadius={2}
            borderStroke="#6366f1"
            borderStrokeWidth={1.25}
            rotateAnchorOffset={36}
            padding={2}
            boundBoxFunc={(oldBox, newBox) =>
              newBox.width < 5 || newBox.height < 5 ? oldBox : newBox
            }
            anchorStyleFunc={(anchor) => {
              if (anchor.hasName("rotater")) {
                anchor.width(ROTATE_ANCHOR_SIZE);
                anchor.height(ROTATE_ANCHOR_SIZE);
                anchor.offsetX(ROTATE_ANCHOR_SIZE / 2);
                anchor.offsetY(ROTATE_ANCHOR_SIZE / 2);
                anchor.cornerRadius(ROTATE_ANCHOR_SIZE / 2);
                anchor.strokeWidth(1.25);
                anchor.shadowColor("rgba(0,0,0,0.18)");
                anchor.shadowBlur(4);
                anchor.shadowOffsetY(1);

                if (rotateIcon) {
                  anchor.fillPriority("pattern");
                  anchor.fillPatternImage(rotateIcon);
                  anchor.fillPatternRepeat("no-repeat");
                  // Scale the icon to exactly fill the handle — the SVG's own
                  // viewBox padding gives it visual breathing room already,
                  // so no extra offset math is needed to center it.
                  anchor.fillPatternScale({
                    x: ROTATE_ANCHOR_SIZE / rotateIcon.width,
                    y: ROTATE_ANCHOR_SIZE / rotateIcon.height,
                  });
                }

                // Custom rotate cursor on hover, matching the handle's icon.
                anchor.off("mouseenter.rotateCursor mouseleave.rotateCursor");
                anchor.on("mouseenter.rotateCursor", () => {
                  const container = anchor.getStage()?.container();
                  if (container) container.style.cursor = ROTATE_CURSOR;
                });
                anchor.on("mouseleave.rotateCursor", () => {
                  const container = anchor.getStage()?.container();
                  if (container) container.style.cursor = "default";
                });
              } else {
                anchor.shadowColor("rgba(0,0,0,0.15)");
                anchor.shadowBlur(3);
                anchor.shadowOffsetY(1);
              }
            }}
          />
        </Layer>
      </Stage>

      {editingText && (
        <textarea
          autoFocus
          value={editingText.value}
          onChange={(e) => setEditingText({ ...editingText, value: e.target.value })}
          onFocus={(e) => e.target.select()}
          onBlur={() => commitEditingText()}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              commitEditingText();
            } else if (e.key === "Escape") {
              commitEditingText(true);
            }
          }}
          style={{
            position: "absolute",
            top: editingText.top,
            left: editingText.left,
            width: editingText.width,
            fontSize: editingText.fontSize,
            lineHeight: 1.2,
            fontFamily: "Arial, sans-serif",
            color: editingText.fill,
            transform: `rotate(${editingText.rotation}deg)`,
            transformOrigin: "left top",
            border: "1.5px solid #6366f1",
            borderRadius: 4,
            padding: 2,
            margin: 0,
            background: "white",
            outline: "none",
            resize: "none",
            overflow: "hidden",
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
}