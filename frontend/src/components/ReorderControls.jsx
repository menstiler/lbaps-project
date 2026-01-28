
const ReorderControls = ({ index, fieldOrderLength, onMoveUp, onMoveDown }) => (
    <div className="field-reorder-controls">
        <div className="drag-handle" title="Drag to reorder">
            ⋮⋮
        </div>
        <div className="field-reorder-buttons">
            <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="field-reorder-button"
                title="Move up"
            >
                ^
            </button>
            <button
                type="button"
                onClick={onMoveDown}
                disabled={index === fieldOrderLength - 1}
                className="field-reorder-button down"
                title="Move down"
            >
                ^
            </button>
        </div>
    </div>
);

export default ReorderControls;