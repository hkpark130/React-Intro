import React from 'react';
import img1 from '../images/index.jpg';
import imgMovePage from '../images/movepage.jpg';

function Kotlin() {
    return(
        <div class="component">
            <h1>Todo List (Kotlin)</h1>
            Kotlin을 이용하여 Todo List 앱을 기획하였습니다.<br/>
            데이터는 안드로이드의 Preference를 이용하여 저장하고 있습니다.<br/><br/>
            비행기 내에서 출입국 신고서를 작성할 때 항상 여권번호와 해당 국가 체류주소를 까먹어서 <br/>
            네트워크가 필요없는 간단한 메모장을 만들자라고 생각하였고 해당 프로젝트를 개발하게 되었습니다.
            

            <div>
                <h1>해당 프로젝트 Github 주소</h1>
                Todo List 앱 소스코드는&nbsp;
                <a href='https://github.com/hkpark130/TodoList-Kotlin' target='_blank'>
                    <u>
                        <img
                            src={ imgMovePage }
                            width='18'
                            height='18'
                        />
                        https://github.com/hkpark130/TodoList-Kotlin
                    </u>
                </a>
                를 확인해주세요.<br/><br/>
            </div>
            
            <div>
                <img
                    src={ img1 }
                    width='729'
                    height='709'
                />
            </div>
        </div>
    );
}

export default Kotlin;
