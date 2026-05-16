import { getAllInstantPreviews } from "../lib/categoryImages";
import CategoryPicker from "./selection/CategoryPicker";

/** Home “selection” — category picker then per-category shelves. */
export default function HomeSelection() {
  return <CategoryPicker items={getAllInstantPreviews()} />;
}
