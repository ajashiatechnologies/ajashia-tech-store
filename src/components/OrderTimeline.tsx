const STATUS_STEPS = ["placed", "packed", "shipped", "delivered"];

const OrderTimeline = ({ status }: { status: string }) => {
  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-2">
      {STATUS_STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              index <= currentIndex
                ? "bg-[#813FF1]"
                : "bg-gray-600"
            }`}
          />
          {index < STATUS_STEPS.length - 1 && (
            <div
              className={`w-6 h-[2px] ${
                index < currentIndex
                  ? "bg-[#813FF1]"
                  : "bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default OrderTimeline;
