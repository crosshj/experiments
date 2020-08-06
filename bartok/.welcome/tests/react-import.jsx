
import { hello } from '/bartok/.welcome/tests/react-imported.mjs';

const App = () =>{
    return (
        <div>
            <Style />
            <div className='container'>
                <span className='label'>FROM IMPORTED MODULE:</span>
                <span className='output'>{hello()}</span>
            </div>
        </div>
    );
};

const Style = () => {
    return (
        <style dangerouslySetInnerHTML={{__html: `
            .container {
                margin-top: 4em;
            }
            .label {
                color: #ccc;
                margin-right: 0.5em;
                margin-left: 1em;
            }
            .output {
                color: #a9a977;
            }
        `}} />
    );
};
