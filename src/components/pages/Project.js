import {parse, v4 as uuidv4} from 'uuid'

import styles from './Project.module.css'
import {useParams} from 'react-router-dom'
import {useState, useEffect} from 'react'

import Loading from '../layout/Loading'
import Container from '../layout/Container'
import ProjectForm from '../project/ProjectForm'
import ServiceForm from '../service/ServiceForm'
import Message from '../layout/Message'

function Project () {
    
   const {id} = useParams()
   //console.log(id)
   const [project, setProject] = useState ([])

   const [showProjectForm, setShowProjectForm] = useState(false)
   const [showServiceForm, setShowServiceForm] = useState(false)
   const [message,setMessage] = useState()
   const [type, setType] = useState()
   

   useEffect (() => {
    setTimeout(() => {
        fetch (`http://localhost:5000/projects/${id}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then((resp)=> resp.json())
    .then((data) => {
        setProject(data)
    } )
    .catch((err)=> console.log)
    }, 3000)
   }, [id]
   
   )

   function editPost (project) {
    setMessage('')

    //budget validation
     if (project.budget < project.cost) {
        setMessage ('Orçamento não pode ser menor que o custo do projeto!') //Quando o custo do projeto for menor que o custo total ele vai mandar essa mensagem
        setType('error')
        return false //Pra parar a edição e não enviar pro banco 
     }

     fetch (`http://localhost:5000/projects/${project.id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json',
     },
     body: JSON.stringify(project),
    })
    .then((resp) => resp.json())
    .then ((data) => {
        setProject(data)
        setShowProjectForm(false)
        //mensagem de edição terminada, "setShowProjectForm(false)" pra não mostrar mais o project form ja que a edição terminou
        setMessage ('Projeto atualizado') //Quando o custo do projeto estiver dentro dos limites
        setType('sucess')

    })

   }

   function createService (project) {
    //last service
    const lastService = project.services[project.services.length - 1]
    lastService.id = uuidv4 ()

    const lastServiceCost = lastService.cost
    const newCost = parseFloat(project.cost) + parseFloat(lastServiceCost)

    if (newCost > parseFloat(project.budget)) {
        setMessage ('Orçamento ultrapassado. Verifique o valor do serviço.')
        setType('error')
        project.services.pop()
        return false
    }



   }

   function toggleProjectForm () {
    setShowProjectForm (!showProjectForm)
   }
   function toggleServiceForm () {
    setShowServiceForm (!showServiceForm)
   }

    return (
    <>
    {project.name ? (<div className={styles.project_details}>
        <Container customClass="column">
            {message && <Message type={type} msg={message} />}
            <div className={styles.details_container}>
                <h1>Projeto: {project.name}</h1>
                <button className={styles.btn} onClick={toggleProjectForm}>
                    {!showProjectForm ? 'Editar projeto' : 'Fechar'}
                </button>
                {!showProjectForm ? (
                    <div  className={styles.project_info} >
                        <p><span>Categoria </span>{project.category.name}</p>
                        <p>
                            <span>Total de Orçamento:</span> R${project.budget}
                        </p>
                        <p>
                            <span>Total Utilizado:</span> R${project.cost}
                        </p>
                    </div>
                ) : (
                    <div className={styles.project_info}><ProjectForm handleSubmit={editPost} btnText="Concluir edição" projectData={project}
                    />
                    </div>
                ) }
            </div>
            <div className={styles.service_form_container}>
                <h2>Adicione um serviço:</h2>
                <button className={styles.btn} onClick={toggleServiceForm}>
                    {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                </button>
                <div className={styles.project_info}>
                    {showServiceForm &&   /*se o showServiceForm estiver sendo usado então(&&) vai mostrar a div "formulario de serviços" */
                        (<ServiceForm 
                        handleSubmit={createService}
                        btnText="Adicionar serviço"
                        projectData={project}
                        />)
                    }

                </div>

            </div>
            <h2>Serviços</h2>
            <Container customClass="start">
                <p>Itens de serviços</p>
            </Container>

        </Container>
    </div>) : (<Loading/>)}
    </>/*Se aparece o "project.name" ?(então) aparece a div : (se não) mostra o loading*/
    )
}

export default Project