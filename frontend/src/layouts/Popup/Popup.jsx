import React from 'react';
import { Routes, Route } from 'react-router-dom';

import routes from '../../routes.js';
import { useDarkTheme } from '../../useDarkTheme.js';

const estilo = {
  popupContent: {
    width: '100%'
  },
  popupComponentes: {
    height: '100vh',
    'box-shadow': 'unset'
  }
}

const Popup = () => {

  useDarkTheme();

  return (
    <div id="main">
      <div id="container">

        {/* CONTEÚDO */}
        <div id="content" style={estilo.popupContent}>

          <div id="componentes" style={estilo.popupComponentes}>

            {/* DEFINE AS ROTAS E RESPECTIVOS COMPONENTES DE ACORDO COM O routes.js */}
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.component}>

                  {/* DEFINE AS SUBROTAS, QUANDO HOUVER */}
                  {route.subRoutes && route.subRoutes.map((subRoute, subIndex) => (
                    <Route
                      key={subIndex}
                      path={['editar'].includes(subRoute.path) ? `${subRoute.path}/:_colecao/:id`
                        :
                        subRoute.path === 'editardemanda' ? `${subRoute.path}/:id_demanda`
                          :
                          subRoute.path
                      }
                      element={subRoute.component}
                    //Se for 'editar/editardemanda', deve ter coleção e id obrigatórios, por isso definido somente acima
                    //já se for 'cadastrar', pode ser sem coleção e id, que serão definidos acima (map)
                    //como também é definido abaixo o caso específico para receber coleção
                    />
                  ))}

                  {/* <Route path="listar/:_colecao" element={<GCListar />} /> */}
                  {/* <Route path="cadastrar/:_colecao" element={<GCEditarCriar />} /> */}
                  <Route path="listar/:_colecao" element={route?.subRoutes?.[0]?.path === 'listar' && route.subRoutes[0].component} />
                  <Route path="cadastrar/:_colecao" element={route?.subRoutes?.[1]?.path === 'cadastrar' && route.subRoutes[1].component} />

                </Route>
              ))}
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Popup;