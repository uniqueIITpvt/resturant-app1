export function generateMetadata({ params }: { params: { category: string } }) {
  const categoryId = params.category;
  const formattedCategory =
    categoryId.charAt(0).toUpperCase() + categoryId.slice(1);

  return {
    title: `${formattedCategory} Menu | Our Restaurant`,
    description: `Browse our selection of ${categoryId} items on the menu.`,
  };
}
