import {
  Fields,
  Link,
  LookerChartUtils,
  TooltipData,
  TooltipRow,
  VisConfig,
  VisData,
} from "../types";
import React, { useEffect, useMemo, useState } from "react";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { formatNumber } from "../utils";
import styled from "styled-components";
import {
  Chart as ChartJS,
  ArcElement,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip as ChartJsTooltip,
  LineController,
  BarController,
  ScatterController,
  ChartType,
  ChartOptions,
  Filler,
  ChartData,
  Point,
  BubbleDataPoint,
  ChartTypeRegistry,
  TooltipModel,
} from "chart.js";
import Tooltip from "./Tooltip";
import { Chart } from "react-chartjs-2";
import "bootstrap/scss/bootstrap.scss";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";

ChartJS.register(
  LinearScale,
  ArcElement,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  ChartJsTooltip,
  LineController,
  BarController,
  Filler,
  ScatterController,
  ChartDataLabels
);



interface BarLineVisProps {
  data: VisData;
  fields: Fields;
  config: VisConfig;
  lookerCharts: LookerChartUtils;
  lookerVis?: any;
}

const chartPlugins = [
  {
    id: "padding-below-legend",
    beforeInit(chart: any) {
      // Get a reference to the original fit function
      const originalFit = chart.legend.fit;

      // Override the fit function
      chart.legend.fit = function fit() {
        // Call the original function and bind scope in order to use `this` correctly inside it
        originalFit.bind(chart.legend)();
        this.height += 10;
      };
    },
  },
];


ChartJS.defaults.font.family = "Roboto";
ChartJS.defaults.font.size = 15;
ChartJS.defaults.color = "#262D33";




function BarLineVis({
  data,
  fields,
  config,
  lookerCharts
}: BarLineVisProps): JSX.Element {


  // config values
  const {
    isYAxisCurrency,
    showXGridLines,
    showYGridLines,
    showXAxisLabel,
    xAxisText,
    showYAxisLabel,
    yAxisText,
    titleText,
    showKpi,
    kpiUnit,
    isStacked,
    showLineChartGradient,
    showAllValuesInTooltip,
    titleSize,
    xAxisSize,
    yAxisSize,
    color_range
  } = config;

  // Chart type toggle
  interface ChartTypeOption {
    label: string;
    value: ChartType;
  }

  const chartTypeOptions: ChartTypeOption[] = [
    {
      label: "Bar",
      value: "bar",
    },
    // {
    //   label: "Line",
    //   value: "line",
    // },
    // {
    //   label: "Doughnut",
    //   value: "doughnut",
    // },
    // {
    //   label: "Scatter",
    //   value: "scatter",
    // },
  ];

  const [selectedChartType, setSelectedChartType] = useState(
    chartTypeOptions[0].value
  );

  // map Looker query data to ChartJS data format
  const dimensionName = fields.dimensions[0];
  const measureName = fields.measures[0];
  const previousPeriodFieldName = fields.measures[0];

  const dimensionLabel = fields.dimensionsLabel[0];
  const measureLabel = fields.measuresLabel[0];


const [firstData = {}] = data;
let cols_to_hide = [];

for (const [key, value] of Object.entries(firstData)) {
  if (key.split(".")[1] === "currency_number_format") {
    cols_to_hide = firstData[key].value.split(",").map((e) => e.trim());

  }
}

//
// var word = measureName.split(".")[1]
//
//
// var word = word.replace(/_/g, ' ').replace(/(?: |\b)(\w)/g, function(word) { return word.toUpperCase()});
//
// console.log(word)

// console.log(firstData, "one")
// console.log(cols_to_hide, "two")

// let text = cols_to_hide.toString().slice(0, -1);
let text = cols_to_hide.toString()


  const labels = data.map(
    (row) => row[dimensionName].rendered ?? row[dimensionName].value ?? "∅"
  );



  // const colors = ["#6253DA", "#D0D9E1", "#6CBFEF", "#A3D982", "#E192ED"];
  const colors = config.color_range


console.log(colors[0], colors)

  const hasPivot = !!fields.pivots && fields.pivots.length > 0;

  const hasNoPivot = !!fields.pivots && fields.pivots.length === 0;

  const fill = showLineChartGradient ? "origin" : false;

  // console.log(hasPivot, hasNoPivot, "ekbeibew")

  const defaultChartData: ChartData<
    | "bar"
    | "line"
    | "scatter"
    | "bubble"
    | "pie"
    | "doughnut"
    | "polarArea"
    | "radar",
    (number | Point | [number, number] | BubbleDataPoint)[],
    any
  > = {
    labels,
    datasets: [],
  };
  const [chartData, setChartData] = useState(defaultChartData);

  // function createGradient(
  //   ctx: CanvasRenderingContext2D,
  //   startColor: string,
  //   endColor: string
  // ): CanvasGradient {
  //   const gradientFill = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
  //   gradientFill.addColorStop(0, startColor);
  //   gradientFill.addColorStop(1, endColor);
  //   return gradientFill;
  // }

  function updateChartData(chartType: ChartType) {
    let datasets = [];
    let canvasElement = document.getElementById("chart") as HTMLCanvasElement;
    if (canvasElement) {
      const ctx = canvasElement.getContext("2d");


      if (hasPivot) {
        const pivotValues = Object.keys(data[0][measureName]);

        pivotValues.forEach((pivotValue, i) => {
          const columnData = data.map(
            (row) => row[measureName][pivotValue].value
          );

          // const gradientFill = createGradient(
          //   ctx,
          //   `#${colors[i]}`,
          //   `#${colors[i]}00`
          // );

          datasets.push({
            datalabels: {
             color:  `${color_range ? colors[i] : colors[i]}`,
             fontWeight:'600'
           },
            labels:pivotValues,
            type: chartType,
            label: pivotValue,
            // barThickness: 75,
            backgroundColor:`${color_range ? colors[i] : colors[i]}`,
            borderColor: `${color_range ? colors[0] : colors[0]}`,
            pointBackgroundColor: `${color_range ? colors[0] : colors[0]}`,
            data: columnData,
            yAxisID: "yLeft",
            fill,
          });


        });
      }
      else {
        // const gradientFill = createGradient(
        //   ctx,
        //   `#${colors[0]}`,
        //   `#${colors[0]}00`
        // );

        datasets.push({
               type: chartType,
               label: measureLabel,
               backgroundColor:colors[0],
               borderColor: `#${colors[0]}`,
               pointBackgroundColor: `#${colors[0]}`,
               data: data.map((row) => row[measureName].value),
               yAxisID: "yLeft",
               fill,
        });
      }
      setChartData({ labels, datasets });
    }
  }

  useEffect(() => {
    updateChartData(selectedChartType);
  }, []);

  // chart tooltip
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const hasPeriodComparisonMeasure = fields.measures.length > 1;
  const periodComparisonMeasure = fields.measures[1];



  interface TooltipContext {
    chart: ChartJS<
      keyof ChartTypeRegistry,
      (number | Point | [number, number] | BubbleDataPoint)[],
      unknown
    >;
    tooltip: TooltipModel<"bar" | "line">;
  }

  function tooltipHandler(
    context: TooltipContext,
    isYAxisCurrency: boolean,
    setTooltip: (newState: TooltipData | null) => void
  ) {
    const isTooltipVisible = context.tooltip.opacity !== 0;
    if (isTooltipVisible) {
      const position = context.chart.canvas.getBoundingClientRect();


      //
      // console.log(context.tooltip.dataPoints[0].formattedValue, "elizabetusvfuswvuye")

      const { dataIndex } = context.tooltip.dataPoints[0];


      const lookerRow = data[dataIndex];


      let rows: TooltipRow[] = [];
      if (showAllValuesInTooltip ) {
        Object.entries(lookerRow[measureName]).forEach(

          ([pivotName, { value: currentPeriodValue }], i) => {


            // Period comparison
            const previousPeriodValue =
              lookerRow[previousPeriodFieldName][pivotName].value;

            const hasPreviousPeriod =
              hasPeriodComparisonMeasure && !!previousPeriodValue;
            const periodComparisonValue =
              ((currentPeriodValue - previousPeriodValue) /
                previousPeriodValue) *
              100;



            rows.push({
              hasPreviousPeriod,

              measureValue: `${
                isYAxisCurrency ? "$" : ""
              }${currentPeriodValue}`,

              periodComparisonValue,
              pivotColor: `#${colors[i]}`,
              pivotText: pivotName,


            });


          }
        );
      }


      else {

        const pivotValue = context.tooltip.dataPoints[0].dataset.label;


        const previousPeriodValue =
          data[dataIndex][periodComparisonMeasure][pivotValue].value;
        const currentPeriodValue = context.tooltip.dataPoints[0].raw as number;

        const hasPreviousPeriod =
          hasPeriodComparisonMeasure && !!previousPeriodValue;
        const periodComparisonValue =
          ((currentPeriodValue - previousPeriodValue) / previousPeriodValue) *
          100;

        rows = [
          {
            hasPreviousPeriod,
            measureValue: `${isYAxisCurrency ? "$" : ""}${
              context.tooltip.dataPoints[0].formattedValue
            }`,

            periodComparisonValue,
            pivotColor: context.tooltip.dataPoints[0].dataset
              .borderColor as string,
            pivotText: context.tooltip.dataPoints[0].dataset.label,
          },
        ];
      }

      setTooltip({
        dimensionLabel0: `${dimensionLabel}:`,
        dimensionLabel: `${context.tooltip.title[0]}`,
        measureLabel: `${context.tooltip.dataPoints[0].dataset.label}: `,
        measureLabel0: `${context.tooltip.dataPoints[0].formattedValue}`,
        left:
          position.left + window.pageXOffset + context.tooltip.caretX + "px",
        rows,
        top:
          position.top +
          window.pageYOffset +
          context.tooltip.caretY -
          20 +
          "px",
        yAlign: context.tooltip.yAlign,
      });

    } else {
      setTooltip(null);
    }
  }




  // chart options
  const chartOptions: ChartOptions<"bar" | "line"> = useMemo(
    () => ({
      layout: {
        padding: {
          left: 10,
          right: 10,
          top: 50,
          bottom: 10
        },
      },


      onClick: (event, elements, chart) => {
        console.log("event", event);
        console.log("elements", elements);
        console.log("chart", chart);

        if (!elements.length) {
          return;
        }
        const { datasetIndex, index: dataIndex } = elements[0];

        if (hasPivot) {

        const measureLinks = Object.values(data[dataIndex][measureName])[datasetIndex].links ?? [];
        const dimensionLinks = (data[dataIndex][dimensionName].links as Link[]) ?? [];

      }
      else{
        const measureLinks = data[dataIndex][measureName].links ?? [];

        const dimensionLinks = (data[dataIndex][dimensionName].links) ?? [];
      }

        lookerCharts.Utils.openDrillMenu({
          links: [...measureLinks, ...dimensionLinks],
          event: event.native,
        });
      },

      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        datalabels: {
          display:true,
          anchor: 'end',
          align: 'end',

        },
        legend: {
          position: "bottom",
          labels: {
            color:'#262D33',
            font: {
              size: 14,
              weight: '500',
              family: "Roboto"

            },
          usePointStyle: true
         },
        align: "center" as const,
        display: hasNoPivot || hasPivot,
        },
        tooltip: {
          enabled: false,
          position: "nearest",
          external: (context) =>
            tooltipHandler(context, isYAxisCurrency, setTooltip),
        },
      },
      scales: {
        x: {

          grid: {
            display: showXGridLines,
          },
          stacked: isStacked,
          title: {
            display: showXAxisLabel,
            text: `${xAxisText ?  xAxisText  : dimensionLabel}`,
            font: {
              size: `${xAxisSize ?  xAxisSize   : 16}`
            }
          },
        },

        yLeft: {
          grid: {
            display: showYGridLines,
          },
          position: "left" as const,
          stacked: isStacked,
          ticks: {

            callback: function (value: number) {
              return `${isYAxisCurrency ? text : ""}${formatNumber(value)}`;
            },
          },
          title: {
            display: showYAxisLabel,
            text: `${yAxisText ?  yAxisText  : measureLabel }`,
            font: {
                size: `${yAxisSize ?  yAxisSize   : 16}`
            }
          },
        },
      },
    }),
    []
  );

  // KPI value
  const kpiValue = data.reduce((total, currentRow) => {
    let newTotal = total;
    if (hasPivot) {
      const cellValues = Object.values(currentRow[measureName]).map(
        (cell) => cell.value
      );
      for (let i = 0; i < cellValues.length; i++) {
        newTotal += cellValues[i];
      }
    } else {
      newTotal += currentRow[measureName].value;
    }

    return newTotal;
  }, 0);

  function handleChartTypeSelection(newChartType: ChartType) {
    setSelectedChartType(newChartType);
    updateChartData(newChartType);
  }





return (
    <div id="vis-wrapper">
    <div id="across">
    <div id="title-kpi-wrapper">
      <div id="title" style={{ fontSize: titleSize ? titleSize : '24px' }}>{titleText}</div>
      {/*{showKpi && (
        <div id="kpi">
          {kpiValue.toLocaleString()} {kpiUnit}
        </div>
      )}*/}
    </div>
      <div id="header">

        <div id="controls">
            {/*<ButtonGroup size="sm">
            {chartTypeOptions.map((chartTypeOption) => (
              <Button
                active={selectedChartType === chartTypeOption.value}
                key={chartTypeOption.value}
                onClick={() => handleChartTypeSelection(chartTypeOption.value)}
                // variant="outline-secondary"
              >
                {chartTypeOption.label}
              </Button>
            ))}
          </ButtonGroup>
         <ButtonGroup size="sm">
              {marketRegionFilterOptions.map(({ label, value }, i) => (
                <Button
                  active={filters.marketRegion === value}
                  key={value}
                  onClick={() =>
                    handleFilterSelection("marketRegion", value, vis)
                  }
                  variant="outline-secondary"
                >
                  {label}
                </Button>
              ))}
            </ButtonGroup> */}
        </div>
      </div>
</div>

      <div id="chart-wrapper">
        <Chart
          type={selectedChartType}
          data={chartData}
          options={chartOptions}
          id="chart"
          plugins={chartPlugins}
        />
        {tooltip && <Tooltip hasPivot={hasPivot} hasNoPivot={hasNoPivot} tooltipData={tooltip} />}
      </div>
    </div>
  );
}

export default BarLineVis;
