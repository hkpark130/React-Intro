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
            <pre>
                할 것들<br/>
                To do list 앱 코틀린으로 만들기<br/>
                데이터는 DB사용하지 않고 폰에 저장하기
            </pre>

            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
        </div>
    );
}

export default Kotlin;