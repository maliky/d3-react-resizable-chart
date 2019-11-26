import React from "react";
import ReactDOM from "react-dom";

import { Runtime, Inspector } from "@observablehq/runtime";
import notebook from "./notebook/1949747ba1654b78@406";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: 400, height: 300, date: new Date() };
    this.mwidth = 400;
    this.mheight = 300;
    this.refreshID = 0;
    this.chartRef = React.createRef();
  }

  componentDidMount() {
    const runtime = new Runtime();
    runtime.module(notebook, name => {
      if (name === "chart") {
        return new Inspector(this.chartRef.current);
      }
      if (name === "mutable mheight") {
        return {
          fulfilled: value => {
            this.mheight = value;
          }
        };
      }
      if (name === "mutable mwidth") {
        return {
          fulfilled: value => {
            this.mwidth = value;
          }
        };
      }
    });
    //this.timerID = setInterval(() => this.tick(), 1000);
    this.refreshID = setInterval(() => this.refresh(), 1);
  }
  componentDidUpdate(nextProps, nextState) {
    if (nextState.height !== this.state.height) {
      this.mheight.value = nextState.height;
    }
    if (nextState.width !== this.state.width) {
      this.mwidth.value = nextState.width;
    }
  }
  refresh() {
    this.setState({ width: this.state.width + 1 });
    clearInterval(this.refreshID);
  }

  updateDims = event => {
    this.setState({ [event.target.name]: event.target.valueAsNumber });
  };

  render() {
    return (
      <React.Fragment>
        <MyInput
          name="width"
          value={this.state.width}
          onChange={this.updateDims}
        />
        <MyInput
          name="height"
          value={this.state.height}
          onChange={this.updateDims}
        />
        <div ref={this.chartRef} />
      </React.Fragment>
    );
  }
}

function MyInput(props) {
  return (
    <div className={`input-${props.name}`}>
      <small>
        {props.name}: {props.value}
      </small>
      <input
        name={props.name}
        type="range"
        min="20"
        max="1200"
        step="10"
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
ReactDOM.render(<App />, document.getElementById("root"));
