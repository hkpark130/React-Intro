import React from 'react';
import imgSpring from '../images/spring_boot.png';

function Spring() {
    return(
        <div class="component">
            <h1>Spring</h1>

            <div>
                <img
                    src={ imgSpring }
                    width='256'
                    height='128'
                />
            </div>

            <a href='#'>
                <h2>서버로 이동</h2>
            </a>
        </div>
        
    );
}

export default Spring;