export default function CheckoutEmptyState({ onShop }) {
  return (
    <div className="container-fluid py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">السلة فارغة</h1>
      <button onClick={onShop} className="btn-primary">العودة للمتجر</button>
    </div>
  );
}
