import React from 'react';
import imgMovePage from '../images/movepage.jpg';
import imgAws from '../images/certification.jpeg';
import imgHanbit from '../images/hanbit.jpeg';
import imgIdea from '../images/idea.jpeg';

function Github() {
    return(
        <div class="component">
            <h1>Profile</h1>
            <a href='https://github.com/hkpark130' target='_blank'>
                <h2>
                    <img
                        src={ imgMovePage }
                        width='18'
                        height='18'
                    />{" "}
                    Github 이동
                </h2>
            </a>
            <a href='https://www.linkedin.com/in/hyeonkyeong-park-8ab87025b/' target='_blank'>
                <h2>
                    <img
                        src={ imgMovePage }
                        width='18'
                        height='18'
                    />{" "}
                    Linkedin 이동
                </h2>
            </a>

            <div>
                <h1>자격증</h1>
                <img
                    src={ imgAws }
                />
            </div>

            <div>
                <h1>수상경력</h1>
                <img
                    src={ imgHanbit }
                    width='900'
                    height='506'
                />
                <img
                    src={ imgIdea }
                    width='900'
                    height='506'
                />
            </div>
        </div>

       
        
    );
}

export default Github;
