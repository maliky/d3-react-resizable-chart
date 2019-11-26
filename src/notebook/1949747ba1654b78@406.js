export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md) {
    return md`
# Simple line chart to embed in a resizable React Component`;
  });
  main
    .variable(observer("data"))
    .define("data", ["mk_data"], function(mk_data) {
      return mk_data(5);
    });
  main
    .variable(observer("chart_data"))
    .define("chart_data", ["mk_chart", "data"], function(mk_chart, data) {
      return mk_chart(data);
    });
  main
    .variable(observer("chart"))
    .define("chart", ["chart_data"], function(chart_data) {
      return chart_data.rootdiv;
    });
  main.define("initial mheight", function() {
    return 200;
  });
  main
    .variable(observer("mutable mheight"))
    .define(
      "mutable mheight",
      ["Mutable", "initial mheight"],
      (M, _) => new M(_)
    );
  main
    .variable(observer("mheight"))
    .define("mheight", ["mutable mheight"], _ => _.generator);
  main.define("initial mwidth", function() {
    return 900;
  });
  main
    .variable(observer("mutable mwidth"))
    .define(
      "mutable mwidth",
      ["Mutable", "initial mwidth"],
      (M, _) => new M(_)
    );
  main
    .variable(observer("mwidth"))
    .define("mwidth", ["mutable mwidth"], _ => _.generator);
  main
    .variable(observer("chart_g"))
    .define("chart_g", ["chart_data"], function(chart_data) {
      return chart_data.g;
    });
  main
    .variable(observer("chart_style"))
    .define("chart_style", ["chart_data"], function(chart_data) {
      return chart_data.style;
    });
  main
    .variable(observer("mk_chart"))
    .define("mk_chart", ["initChart", "dim", "d3", "style"], function(
      initChart,
      dim,
      d3,
      style
    ) {
      return function(data) {
        const [rootdiv, svg, g] = initChart();

        g.attr("transform", `translate(${dim.mgs.l}, ${dim.mgs.t})`);
        //.attr("viewBox", [dim.mid.ngW, dim.mid.ngH, dim.mid.gW, dim.mid.gH]); //centering

        // scales:
        // x)
        const domX = [0, Object.keys(data).length - 1],
          ranX = [0, dim.gW];

        const xScale = d3.scaleLinear(domX, ranX);

        // y)
        const Ymax = d3.max(data, d => d.y);

        const domY = d3.extent(data, d => d.y),
          ranY = [dim.gH, 0];

        const linScale = d3.scaleLinear();

        const yScale = linScale.domain(domY).range(ranY);

        // Axis :
        const abscissa = d3.axisBottom().scale(xScale),
          ordinates = d3.axisLeft().scale(yScale);

        // Adding axis and datapoint to the drawing zone: g
        g.append("g")
          .attr("class", "x axis")
          .attr("transform", `translate(0, ${dim.gH})`)
          .call(abscissa);

        g.append("g")
          .attr("class", "y axis")
          .attr("transform", `translate(0,0)`)
          .call(ordinates);

        // line generator
        const line = d3
          .line()
          .x(d => xScale(d.x))
          .y(d => yScale(d.y));

        const ligne = g
          .append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

        // data points (last to be on top)
        const P = g
          .selectAll("p")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "point")
          .attr("r", 4)
          .attr("cx", d => xScale(d.x))
          .attr("cy", d => yScale(d.y));

        rootdiv.appendChild(svg.node());
        rootdiv.append(style);
        rootdiv;
        return { rootdiv, g, style };
      };
    });
  main.variable(observer()).define(["md"], function(md) {
    return md`
### Style`;
  });
  main.variable(observer("style")).define("style", ["html"], function(html) {
    return html`
      <style>
        /* Edit to change graph's styles */
        .line {
          stroke: steelblue;
          stroke-width: 3;
        }

        /* Style the dots by assigning a fill and stroke */
        .point {
          fill: red;
          stroke: black;
        }
      </style>
    `;
  });
  main
    .variable(observer("dim"))
    .define("dim", ["mk_dim", "mwidth", "mheight"], function(
      mk_dim,
      mwidth,
      mheight
    ) {
      return mk_dim({ W: mwidth, H: mheight });
    });
  main.variable(observer()).define(["md"], function(md) {
    return md`
### Helpers`;
  });
  main.variable(observer("mk_dim")).define("mk_dim", ["d3"], function(d3) {
    return ({
      W = 400,
      H = 300,
      mgs = { t: 10, r: 10, b: 30, l: 30 }
    } = {}) => {
      // make a dimension object
      // inner graph margins
      const gW = W - mgs.r - mgs.l,
        gH = H - mgs.t - mgs.b;

      // creating half width and hight, negative & positive respectively
      // to use in viewBox, setting the 0 in the middle of the view
      // can also handle two linked charts side by side
      const tmpO = { W, H, gW, gH };
      const mid = Object.keys(tmpO).reduce(
        (o, k) => ({
          ...o,
          [k]: Math.round(tmpO[k] / 2),
          [`n${k}`]: -Math.round(tmpO[k] / 2)
        }),
        {}
      );

      const radius = d3.min([gW, gH]) / 2;

      return { mgs, mid, W, H, gW, gH, radius };
    };
  });
  main
    .variable(observer("initChart"))
    .define("initChart", ["dim", "html", "d3", "DOM"], function(
      dim,
      html,
      d3,
      DOM
    ) {
      return (d = dim) => {
        let div = html`
            <div id="rootdiv"></div>
          `,
          svg = d3.select(DOM.svg(dim.W, dim.H)),
          g = svg
            .append("g")
            .attr("transform", `translate(${d.mgs.r}, ${d.mgs.t})`);
        return [div, svg, g];
      };
    });
  main.variable(observer("mk_data")).define("mk_data", function() {
    return function mk_data(n = 5) {
      const f = x => x;

      let data = [...new Array(n)].map((d, x) => ({
        x: x,
        y: f(x)
      }));
      return data;
    };
  });
  main.variable(observer("d3")).define("d3", ["require"], function(require) {
    return require("d3@5");
  });
  return main;
}
