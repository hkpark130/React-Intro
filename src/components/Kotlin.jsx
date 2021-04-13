import React from 'react';
import imgKotlin from '../images/kotlin.png';

function Kotlin() {
    return(
        <div class="component">
            <h1>Kotlin</h1>
            Kotlin을 이용하여 Todo List 앱 개발을 기획하고 있습니다.

            <h1>프로젝트 링크</h1>
            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
            
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
        </div>
    );
}

export default Kotlin;