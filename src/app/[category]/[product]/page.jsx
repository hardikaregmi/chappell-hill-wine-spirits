import { use } from "react";
import { notFound } from "next/navigation";
import ProductPage, {
  generateStaticParamsForCategory,
} from "../../../components/ProductPage";
import { isValidCategory } from "../../../lib/productCatalog";

export function generateStaticParams() {
  return generateStaticParamsForCategory();
}

export default function CategoryProductPage({ params }) {
  const { category, product } = use(params);

  if (!isValidCategory(category)) {
    notFound();
  }

  return (
    <ProductPage
      category={category}
      basePath={`/${category}`}
      productSlug={product}
    />
  );
}
