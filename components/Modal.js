import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="modal">
            <button onClick={onClose}>Close</button>
            <p>Your modal content here</p>
        </div>,
        document.getElementById('modal-root') // Ensure 'modal-root' exists in your HTML
    );
};

export default Modal;
