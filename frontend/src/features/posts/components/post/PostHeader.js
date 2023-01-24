import { useNavigate } from "react-router-dom"
import useWindowDimensions from "../../../../hooks/useWindowDimensions"
import { getTimeSince } from "../../../../utils/utils"
import { DELETED, DIMENSIONS } from "../../../../constants/constants"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from "@fortawesome/free-regular-svg-icons"

const PostHeader = ({ user, post }) => {
    const { width } = useWindowDimensions()

    const navigate = useNavigate()

    const navHandler = () => navigate(`/authors/${user?.username}`)

    const time = getTimeSince(new Date(post.createdAt))

    const active = !(post.author === DELETED)

    const profileImg = user?.image && active
        ? `url(${user?.image})`
        : 'var(--NO-IMAGE)'

    return (
        <div className="post-header__container">
            <div
                className={`image author-card-image ${user?.image ? 'img-overlay' : ''} 
                    ${!active ? 'deleted' : ''}`}
                style={{backgroundImage: profileImg}}
                onClick={active ? navHandler: undefined}
            />
            <div className="post-header-data__container">
                <div className="post-header-data-top">
                    <div 
                        className={`post-username ${!active ? 'deleted' : ''}`}
                        onClick={active ? navHandler : undefined}
                    >
                        {post.author}
                    </div>
                    { width <= DIMENSIONS.WIDTH.M
                        ? <button className="post-follow-button">Follow</button>
                        : undefined
                    }
                </div>
                <div className="post-header-data-bottom">
                    {time}&nbsp;•&nbsp;{post.readTime} min read&nbsp;
                    •&nbsp;{post.views} <FontAwesomeIcon icon={faEye} />
                </div>
            </div>
        </div>
    )
}

export default PostHeader