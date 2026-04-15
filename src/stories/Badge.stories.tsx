import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Badge } from "../components/ui";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    color: { control: "color" },
    children: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Güç" },
};

export const AllTypes: Story = {
  args: {
    children: "Kas",
    color: "#be7009"
  },

  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge color="#8b7fff">Güç</Badge>
      <Badge color="#4cc9f0">Kardiyo</Badge>
      <Badge color="#06d6a0">Esneklik</Badge>
      <Badge color="#ffd166">Diğer</Badge>
      <Badge color="#ff6b9d">Göğüs</Badge>
    </div>
  )
};
