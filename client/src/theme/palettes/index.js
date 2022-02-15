import CustomOrange from "./custom-orange.json";
import HealthyLeaves from "./healthy-leaves.json";
import SummerSplash from "./summer-splash.json";
/*
try to do programmatically but i can't
https://stackoverflow.com/questions/39686035/import-json-file-in-react
*/
const palettes = [
  {
    name: "custom-orange", // cf. https://www.canva.com/colors/color-meanings/orange/
    label: "Custom Orange",
    data: CustomOrange,
  },
  {
    name: "healthy-leaves", // cf. https://www.canva.com/colors/color-palettes/healthy-leaves/
    label: "Healthy Leaves",
    data: HealthyLeaves,
  },
  {
    name: "summer-splash", // cf. https://www.canva.com/colors/color-palettes/summer-splash/
    label: "Summer Splash",
    data: SummerSplash,
  },
];
export default palettes;
