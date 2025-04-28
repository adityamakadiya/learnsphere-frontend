import "../index.css";

function CategoryFilter({ categories, selectedCategory, onSelect }) {
  return (
    <select
      value={selectedCategory || ""}
      onChange={(e) => onSelect(e.target.value)}
      className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-48"
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

export default CategoryFilter;
