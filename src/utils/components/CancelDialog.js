const CancelDialog = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                        Vorgang wirklich abbrechen?
                    </h3>
                    <p className="text-gray-600">
                        {message}
                    </p>
                </div>
                <div className="border-t px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Zurück
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Ja, abbrechen
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelDialog;