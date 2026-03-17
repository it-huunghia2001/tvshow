"use client";

const branches = [
  { id: "TBD", name: "Toyota Bình Dương" },
  { id: "TMP", name: "Toyota Mỹ Phước" },
];

export default function BranchSelector({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-red-500">
          TOYOTA
        </h1>
        <p className="text-slate-400 text-center mb-8">
          Chọn chi nhánh cho màn hình này
        </p>

        <div className="space-y-4">
          {branches.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                localStorage.setItem("selected_branch_id", b.id);
                onSelect(b.id);
              }}
              className="w-full py-4 bg-slate-700 hover:bg-red-600 rounded-xl text-xl font-medium transition-all duration-300 transform hover:scale-105"
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
