import { applyBrand, brandCss, brandPresets, brandScale, brandVariables } from "@openwarelabs/ui";

// One colour in, eleven steps out, on Openware's lightness curve so the contrast holds.
applyBrand("#0d9488"); // the whole page
applyBrand(brandPresets[2]!.scale); // or a preset: Midnight, Ocean, Teal, Forest, Plum, Rose, Ember
applyBrand(null); // back to midnight

brandScale("#0d9488"); // { 50: "#ebf7f6", …, 950: "#001414" }, to store or send to a server

// One part of a page, such as a customer's own colour in a preview:
<div data-theme="light" style={brandVariables(customer.colour)}>…</div>;

// Or a stylesheet, reaching panes with their own data-theme too:
const css = brandCss("#0d9488", ":root, [data-theme]");
