import { createContext, useContext, useState, useCallback } from 'react';
import CustomDialog from './CustomDialog.jsx';

const DialogContext = createContext(null);

export function DialogProvider({ children }) {
    const [dialogState, setDialogState] = useState(null);

    const closeDialog = useCallback(() => {
        setDialogState(null);
    }, []);

    const showAlert = useCallback(({ type = 'info', title, message }) => {
        return new Promise((resolve) => {
            setDialogState({
                type,
                title,
                message,
                isConfirm: false,
                onConfirm: () => {
                    closeDialog();
                    resolve(true);
                }
            });
        });
    }, [closeDialog]);

    const showConfirm = useCallback(({ type = 'warning', title, message, confirmText = 'Confirm', cancelText = 'Cancel' }) => {
        return new Promise((resolve) => {
            setDialogState({
                type,
                title,
                message,
                isConfirm: true,
                confirmText,
                cancelText,
                onConfirm: () => {
                    closeDialog();
                    resolve(true);
                },
                onCancel: () => {
                    closeDialog();
                    resolve(false);
                }
            });
        });
    }, [closeDialog]);

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {dialogState && (
                <CustomDialog {...dialogState} />
            )}
        </DialogContext.Provider>
    );
}

export function useDialog() {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
}
