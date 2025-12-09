import imgMafia from "../images/mafia.jpg";
import imgCitizen from "../images/sitizen.jpg";
import imgSherif from "../images/sherif.jpg";
import imgWanton from "../images/wanton.jpg";
import imgDoctor from "../images/doctor.jpg";

const roleLabel = {
    mafia: 'Ваша роль: Мафия',
    citizen: 'Ваша роль: Мирный житель',
    sherif: 'Ваша роль: Шериф',
    wanton: 'Ваша роль: Распутница',
    doctor: 'Ваша роль: Доктор',
};

const roleImage = {
    mafia: imgMafia,
    citizen: imgCitizen,
    sherif: imgSherif,
    wanton: imgWanton,
    doctor: imgDoctor,
};

export default function RoleInfo({ role }) {
    if (!role) return <div />;
    return (
        <>
            <strong className='role'>{roleLabel[role]}</strong>
            {roleImage[role] && <img src={roleImage[role]} className='role-img' alt={role} />}
        </>
    );
}
