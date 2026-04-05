import styles from './CustomDialog.module.css';

const ICONS = {
    error: (
        <svg className={styles.iconError} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className={styles.iconCircle} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.iconCross} fill="none" d="M16 16 36 36 M36 16 16 36" />
        </svg>
    ),
    warning: (
        <svg className={styles.iconWarning} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className={styles.iconCircleWarning} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.iconExclamation} fill="none" d="M26 13 v15" />
            <circle className={styles.iconDot} fill="#f59e0b" cx="26" cy="36" r="2" />
        </svg>
    ),
    success: (
        <svg className={styles.iconSuccess} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className={styles.iconCircleSuccess} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.iconCheck} fill="none" d="M14 27 l7 7 16-16" />
        </svg>
    ),
    info: (
        <svg className={styles.iconInfo} viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className={styles.iconCircleInfo} cx="26" cy="26" r="25" fill="none" />
            <path className={styles.iconI} fill="none" d="M26 21 v15" />
            <circle className={styles.iconDotInfo} fill="#3b82f6" cx="26" cy="14" r="2" />
        </svg>
    )
};

export default function CustomDialog({
    type = 'info',
    title,
    message,
    isConfirm,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
}) {
    // Add enter animation class
    return (
        <div className={styles.modalOverlay} onClick={isConfirm ? onCancel : onConfirm}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.iconContainer}>
                    {ICONS[type]}
                </div>
                {title && <h2 className={styles.title}>{title}</h2>}
                <p className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    {isConfirm && (
                        <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onCancel}>
                            {cancelText}
                        </button>
                    )}
                    <button 
                        className={`${styles.btn} ${type === 'error' || type === 'warning' ? styles.btnDanger : styles.btnPrimary}`} 
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
