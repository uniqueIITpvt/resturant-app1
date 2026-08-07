import CategoryClient from '../../../../components/menu/CategoryClient';

export default function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  return <CategoryClient category={params.category} />;
}
