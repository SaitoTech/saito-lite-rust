// components/SaitoReactOverlay.js

import React, { useEffect, useState } from 'react';

const SaitoOverlayReact = ({ 
    app,
    mod,
    show = false, 
    onClose,
    children,
    withCloseBox = true,
    clickToClose = false,
    clickBackdropToClose = true,
    removeOnClose = true,
    className = ''
}) => {
    const [ordinal, setOrdinal] = useState(0);
    const [zIndex, setZIndex] = useState(100);

    useEffect(() => {
        if (show) {
            // Find highest z-index among existing overlays
            let max = 0;
            Array.from(document.querySelectorAll('.saito-overlay')).forEach(
                (ov) => {
                    let temp = parseInt(ov.style.zIndex);
                    if (temp > max) {
                        max = temp;
                    }
                }
            );
            setZIndex(max + 3);

            // Find highest ordinal
            max = 0;
            Array.from(document.querySelectorAll('.saito-overlay')).forEach(
                (ov) => {
                    let temp = parseInt(ov.id.replace('saito-overlay', ''));
                    if (temp > max) {
                        max = temp;
                    }
                }
            );
            setOrdinal(max + 1);
        }
    }, [show]);

    const handleBackdropClick = (e) => {
        if (clickBackdropToClose) {
            onClose();
        }
    };

    const handleOverlayClick = (e) => {
        if (clickToClose) {
            onClose();
        }
    };

    if (!show) return null;

    return (
        <>
            <div 
                id={`saito-overlay${ordinal}`}
                className={`saito-overlay center-overlay ${className}`}
                style={{ zIndex: zIndex }}
                onClick={handleOverlayClick}
            >
                {withCloseBox && (
                    <div 
                        style={{display:"block"}}
                        id={`saito-overlay-closebox${ordinal}`}
                        className="saito-overlay-closebox"
                        onClick={onClose}
                    >
                        <i className="fas fa-times-circle saito-overlay-closebox-btn"></i>
                    </div>
                )}
                {children}
            </div>
            <div
                id={`saito-overlay-backdrop${ordinal}`}
                className={`saito-overlay-backdrop ${className}-backdrop`}
                style={{ zIndex: zIndex - 1 }}
                onClick={handleBackdropClick}
            />
        </>
    );
};

export default SaitoOverlayReact
