/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-base-to-string */
"use client";

import React, { useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Card } from "@/components/ui/card";

interface ChartProps {
  data: {
    name: string;
    total: number;
  }[];
}

export function Chart({ data }: ChartProps) {
  // 1) Chart dimensions
  const width = 600;
  const height = 350;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  // 2) Compute scales only when `data` changes
  const xScale = useMemo(() => {
    return scaleBand<string>({
      domain: data.map((d) => d.name),
      range: [margin.left, width - margin.right],
      padding: 0.2,
    });
  }, [data, margin.left, margin.right]);

  const yScale = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.total), 0);
    return scaleLinear<number>({
      domain: [0, maxValue],
      range: [height - margin.bottom, margin.top],
      nice: true,
    });
  }, [data, margin.bottom, margin.top]);

  return (
    <Card>
      <svg width={width} height={height}>
        <Group>
          {/* 3) Bars */}
          {data.map((d) => {
            const x = xScale(d.name)!;
            const y = yScale(d.total);
            const barWidth = xScale.bandwidth();
            const barHeight = height - margin.bottom - y;

            return (
              <Bar
                key={`bar-${d.name}`}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#0369a1"
                rx={4}
                ry={4}
              />
            );
          })}

          {/* 4) X Axis */}
          <AxisBottom
            top={height - margin.bottom}
            scale={xScale}
            tickFormat={(val) => String(val)}
            tickLabelProps={() => ({
              textAnchor: "middle",
              fontSize: 12,
              fill: "#888888",
            })}
          />

          {/* 5) Y Axis */}
          <AxisLeft
            left={margin.left}
            scale={yScale}
            tickFormat={(val) => `₭${val}`}
            tickLabelProps={() => ({
              textAnchor: "end",
              fontSize: 12,
              fill: "#888888",
            })}
          />
        </Group>
      </svg>
    </Card>
  );
}
