import "./style.scss";
import { createRoot } from "react-dom/client";
import React from "react";
import "bootstrap/scss/bootstrap.scss";
import { Fields, Looker, LookerChartUtils } from "./types";
import BarLineVis from "./components/BarLineVis";

// Global values provided via the Looker custom visualization API
declare var looker: Looker;
declare var LookerCharts: LookerChartUtils;

interface ConfigOptions {
  [key: string]: {
    [key: string]: any;
    default: any;
  };
}

looker.plugins.visualizations.add({
  // The create method gets called once on initial load of the visualization.
  // It's just a convenient place to do any setup that only needs to happen once.
  create: function (element, config) {},

  // The updateAsync method gets called any time the visualization rerenders due to any kind of change,
  // such as updated data, configuration options, etc.
  updateAsync: function (data, element, config, queryResponse, details, done) {



        const { measure_like: measureLike } = queryResponse.fields;
        const { dimension_like: dimensionLike } = queryResponse.fields;

        const dimensions1 = dimensionLike.map((dimension) => ({
          label: dimension.label_short ?? dimension.label,
          name: dimension.name

        }));


        const measures1 = measureLike.map((measure) => ({
          label: measure.label_short ?? measure.label,
          name: measure.name,
        }));


        const fieldOptions = [...dimensions1, ...measures1].map((dim) => ({
          [dim.label]: queryResponse.data.map(row => row[dim.name].value).join(",")
        }));


        const empty = [...dimensions1, ...measures1].map((dim) => ({
            thing: queryResponse.data.map(row => row[dim.name].value).join(",")
        }));




        const fieldOptions2: FieldOptions2[] = [...dimensions1, ...measures1].map((dim) => ({
          [dim.label]: dim.label
        }));



        const { measure_like: measureLike } = queryResponse.fields;
        interface Measure {
          label: string;
          name: string;
        }

        interface Dimension {
          label: string;
          name: string;
        }

        const measures: Measure[] = measureLike.map((measure) => ({
          label: measure.label_short ?? measure.label,
          name: measure.name,
        }));

        const dimensions: Dimensions[] = dimensionLike.map((dimension) => ({
          label: dimension.label_short ?? dimension.label,
          name: dimension.name,
        }));

        interface FieldOption {
          [key: string]: string;
        }
        const fieldOptions0: FieldOption[] = [...dimensions, ...measures].map((all) => ({
          [all.label]: all.name,
        }));



    const lookerVis = this;

    // config
    const configOptions: ConfigOptions = {
      titleText: {
        type: "string",
        display: "text",
        default: "Title Text",
        label: "Title",
        placeholder: "Title Text",
        order: 1,
      },
      titleSize: {
        type: "string",
        label: "Title Font Size",
        default: "24px",
        display: "text",
        placeholder: "24px",

        order: 2,
      },
      showXAxisLabel: {
        type: "boolean",
        label: "Show X Axis Label",
        default: true,
        order: 3,
      },
      xAxisText: {
        type: "string",
        label: "X Axis Text",
        default: "",
        order: 4,
      },
      xAxisSize: {
        type: "number",
        label: "X Axis Font Size",
        default: 16,
        display: "text",
        placeholder: "",

        order: 5,
      },
      showYAxisLabel: {
        type: "boolean",
        label: "Show Y Axis Label",
        default: true,
        order: 6,
      },
      yAxisText: {
        type: "string",
        label: "Y Axis Text",
        default: "",
        order: 7,
      },
      yAxisSize: {
        type: "number",
        label: "Y Axis Font Size",
        default: 16,
        display: "text",
        placeholder: "",

        order: 8,
      },
      showXGridLines: {
        type: "boolean",
        label: "Show X Grid Lines",
        default: false,
        order: 9,
      },
      showYGridLines: {
        type: "boolean",
        label: "Show Y Grid Lines",
        default: true,
        order: 10,
      },
      isYAxisCurrency: {
        type: "boolean",
        label: "Format Y Axis as Currency",
        default: true,
        order: 11,
      },

      isStacked: {
        type: "boolean",
        label: "Stacked",
        default: false,
        order: 12,
      },

      showAllValuesInTooltip: {
        type: "boolean",
        label: "Show All Row Values in Tooltip",
        default: true,
        order: 13,
      },


  //   yAxisLeftValues: {
  //   label: "Choose Measure for Chart",
  //   type: "string",
  //   display: "select",
  //   default: "",
  //   values: fieldOptions0,
  //
  //   order: 14,
  // },

      color_range: {
      type: 'array',
      label: 'Color Range',
      display: 'colors',
      default: ['#1A73E8', '#12B5CB', '#E52592', '#E8710A', '#F9AB00', '#dd3333', '#80ce5d', '#f78131', '#369dc1', '#c572d3', '#36c1b3', '#b57052', '#ed69af'],
      order: 24,

    }
    };


    lookerVis.trigger("registerOptions", configOptions);





    // assign defaults to config values, which first render as undefined until configOptions is registered
    const validatedConfig = { ...config };
    const configKeys = Object.keys(validatedConfig);
    for (let i = 0; i < configKeys.length; i++) {
      if (validatedConfig[configKeys[i]] === undefined) {
        const configKey = configKeys[i] as keyof typeof configOptions;
        validatedConfig[configKey] = configOptions[configKey].default;
      }
    }

    // get dimensions and measures
    const { dimension_like, measure_like, pivots } = queryResponse.fields;
    const fields: Fields = {
      dimensions: dimension_like.map((d) => d.name),
      dimensionsLabel: dimension_like.map((d) => d.label),
      measures: measure_like.map((m) => m.name),
      measuresLabel: measure_like.map((m) => m.label),
      pivots: pivots?.map((p) => p.name),
    };




if (empty[1].thing === "" || empty[0].thing === ""){


  // create react root
  element.innerHTML = "<div id='app'><p style='text-align:center;font-size:1.25em;padding-top:2em;font-family: 'Open Sans',serif;'>The data returned from the query is empty.</p></div>";


       }
else {

    // create react root
    element.innerHTML = '<div id="app"></div>';



    const root = createRoot(document.getElementById("app"));
    root.render(
      <BarLineVis
        data={data}
        fields={fields}
        config={validatedConfig}
        lookerCharts={LookerCharts}
      />
    );

  }

    done();
  },

});
