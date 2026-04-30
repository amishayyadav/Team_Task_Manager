import { Component } from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary:", error, info);
  }
  reset = () => this.setState({ hasError: false, error: null });
  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold mb-2">Something broke</h1>
          <p className="text-muted-foreground mb-6">
            {this.state.error?.message || "Unexpected error. Try refreshing the page."}
          </p>
          <Button onClick={this.reset}>Try again</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
