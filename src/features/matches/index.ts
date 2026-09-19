export { MatchInputScreen } from './components/MatchInputScreen';

// `retakeQuestionnaire` SENGAJA tidak diekspor lewat barrel ini — barrel ini
// juga mengekspor `MatchInputScreen` (komponen UI dengan dependensinya
// sendiri: react-hook-form, submitMatch, offline queue). Kalau
// `retakeQuestionnaire` diekspor di sini, siapa pun yang mengimpornya
// (mis. SaveResultSection di layar hasil, dimuat semua pengunjung) ikut
// menarik seluruh MatchInputScreen ke chunk-nya, membatalkan pemisahan
// chunk yang sudah diatur di app/router.tsx. Import langsung dari
// `../matches/lib/recalculate-profile` di pemanggil yang butuh fungsi ini.
