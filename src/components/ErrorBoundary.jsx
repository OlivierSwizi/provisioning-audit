// FILENAME: src/components/ErrorBoundary.jsx
import React from "react";
import PropTypes from "prop-types";
import { Result, Button } from "antd";

export default class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onReset: PropTypes.func,
  };

  static defaultProps = {
    onReset: null,
  };

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // TODO: brancher ici un logger (Sentry etc.)
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    const { hasError, error } = this.state;
    if (!hasError) return this.props.children;

    return (
      <Result
        status="error"
        title="Une erreur est survenue"
        subTitle={error?.message || "Désolé, quelque chose s'est mal passé."}
        extra={[
          <Button key="retry" type="primary" onClick={this.handleReset}>
            Réessayer
          </Button>,
          <Button key="home" onClick={() => (window.location.href = "/")}>
            Retour à l’accueil
          </Button>,
        ]}
      />
    );
  }
}
