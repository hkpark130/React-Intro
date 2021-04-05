import React from 'react';
import imgRedmine from '../images/redmine.jpg';
import imgRedmineDia from '../images/redmine-dia.jpg';

function Redmine() {
    return(
        <div class="component">
            <h1>Redmine</h1>
            
            <div>
                Github의 각 브랜치의 커밋 내용에는 해당 수정사항의 상세 내용을 기재해놓은 레드마인이 있는 링크를 가리킵니다.
                <br/><br/>
            </div>

            <div>
                <img
                    src={ imgRedmine }
                />
            </div>

            <div>
                <h1>서버 구성도</h1>
                <img
                    src={ imgRedmineDia }
                />
            </div>

            <a href='https://hkpark130.p-e.kr:8080/'>
                <h2>Redmine 서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Redmine;