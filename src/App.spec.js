import React from "react";
import { render } from "./test-utils";
import App from "./App";

describe("App", () => {
  let view;

  beforeEach(() => {
    view = render(<App />);
  });

  it("renders without crashing", () => {
    expect(view.getByTestId("App")).toBeInTheDocument();
  });
});
