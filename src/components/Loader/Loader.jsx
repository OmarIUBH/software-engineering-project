import './Loader.css';

export default function Loader() {
    return (
        <div className="loader-container">
            <div className="plate-loader">
                <div className="fork"></div>
                <div className="knife"></div>
            </div>
            <p className="loader-text">Loading...</p>
        </div>
    );
}
