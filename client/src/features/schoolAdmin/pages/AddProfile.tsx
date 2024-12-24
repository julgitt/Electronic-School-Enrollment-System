import {addProfile} from "../services/profileService.ts";
import ProfileForm from "../components/ProfileForm.tsx";
import withProfileForm from "../hoc/withProfileForm.tsx";


export default AddProfile = withProfileForm(ProfileForm, addProfile);
