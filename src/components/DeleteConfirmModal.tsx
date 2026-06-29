"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "حذف وظیفه",
  message = "آیا از حذف این وظیفه اطمینان دارید؟ این عمل قابل بازگشت نیست.",
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-slide-up">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-3xl">🗑</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 leading-6">{message}</p>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-danger text-white rounded-xl font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
          >
            حذف
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-200 transition-colors cursor-pointer"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}
