import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ChurchProvider } from "@/contexts/ChurchContext";

export function renderWithChurch(ui, { withRouter = false } = {}) {
  const wrapped = withRouter ? <MemoryRouter>{ui}</MemoryRouter> : ui;
  return render(<ChurchProvider>{wrapped}</ChurchProvider>);
}
