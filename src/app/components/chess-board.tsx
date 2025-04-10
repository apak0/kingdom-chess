"use client";

export default function ChessBoard() {
  return (
    <div className="relative">
      {/* File labels (A-H) */}
      <div className="flex justify-between px-8 mb-1">
        {["A", "B", "C", "D", "E", "F", "G", "H"].map((file) => (
          <div key={file} className="w-16 text-center text-sm static">
            {file}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Rank labels (8-1) */}
        <div className="flex flex-col justify-between py-2 pr-2">
          {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
            <div key={rank} className="h-16 flex items-center text-sm static">
              {rank}
            </div>
          ))}
        </div>

        {/* Chess board */}
        <div className="grid grid-cols-8 gap-0 border-2 static">
          {/* Add your existing code for squares here */}
        </div>
      </div>
    </div>
  );
}
