import React from 'react';
import imgRedmine from '../images/redmine.jpg';
import imgRedmineDia from '../images/redmine-dia.jpg';
import imgMovePage from '../images/movepage.jpg';

function Redmine() {
    return(
        <div class="component">
            <h1><strike>Redmine</strike><br></br>(EC2 메모리 사양상 현재는 사용하지 않습니다.)</h1>
            
            <div>
                태스크 관리 페이지입니다. <br/>
                Github의 각 브랜치의 커밋 내용에는 해당 수정사항의 상세 내용을 기재해놓은 레드마인의 링크를 가리킵니다.
                <br/><br/>
            </div>
            <div>
                <img
                    src={ imgRedmine }
                />
            </div>

            <h1>프로젝트 링크</h1>
            <a href='https://hkpark130.p-e.kr:8080/' target='_blank'>
                <h2>
                    <img
                        src={ imgMovePage }
                        width='18'
                        height='18'
                    />{" "}
                    Redmine 페이지로 이동
                </h2>
            </a>

            <div>
                <h1>서버 구성도</h1>
                <img
                    src={ imgRedmineDia }
                />
            </div>

        </div>
        
    );
}

export default Redmine;
