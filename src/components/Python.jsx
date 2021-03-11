import React from 'react';
import imgPython from '../images/python.png';

function Python() {
    return(
        <div class="component">
            <h1>Python</h1>

            <div>
                <img
                    src={ imgPython }
                    width='230'
                    height='128'
                />
            </div>

            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Python;