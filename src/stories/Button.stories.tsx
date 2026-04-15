import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Button } from "../components/ui";
import { Zap } from "lucide-react";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#07071a" }],
    },
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    children: "Antrenman Planla",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "md",
    children: "Son Antrenmanı Kopyala",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    size: "md",
    children: "İptal",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    size: "md",
    children: "Antrenmanı Sil",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    size: "lg",
    children: (
      <>
        <Zap size={16} /> Yeni Antrenman
      </>
    ),
  },
};

export const AllSizes: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}
    >
      <Button variant="primary" size="sm">
        Small
      </Button>
      <Button variant="primary" size="md">
        Medium
      </Button>
      <Button variant="primary" size="lg">
        Large
      </Button>
    </div>
  ),
};
