import {updateProfile} from "../services/profileService.ts";
import ProfileForm from "../components/ProfileForm.tsx";
import withProfileForm from "../hoc/withProfileForm.tsx";

export default EditProfile = withProfileForm(ProfileForm, updateProfile, '/api/admin/profile');
