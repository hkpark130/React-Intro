import React from 'react';
import imgKotlin from '../images/kotlin.png';

function Kotlin() {
    return(
        <div class="component">
            <h1>Kotlin</h1>

            <div>
                <img
                    src={ imgKotlin }
                    width='512'
                    height='128'
                />
            </div>

            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
        </div>
    );
}

export default Kotlin;