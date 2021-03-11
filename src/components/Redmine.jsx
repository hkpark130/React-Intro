import React from 'react';
import imgRedmine from '../images/redmine.jpg';

function Redmine() {
    return(
        <div class="component">
            <h1>Redmine</h1>
            
            <div>
                <img
                    src={ imgRedmine }
                    width='128'
                    height='128'
                />
            </div>

            <a href='https://hkpark130.p-e.kr:8080/'>
                <h2>Redmine 서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Redmine;