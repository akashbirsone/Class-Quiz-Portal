import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xixiuzlrmmnfwwttvcmw.supabase.co';
const supabaseKey = 'sb_publishable_0JrbQXdrwS7cnYS5yA0Bbg_8Pl3eWRX';
const supabase = createClient(supabaseUrl, supabaseKey);

const run = async () => {
    try {
        console.log('Searching for DBMS quiz...');
        const { data: quizzes, error } = await supabase.from('quizzes').select('*');
        if (error) throw error;

        const dbmsQuiz = quizzes.find(q => q.title.toLowerCase().includes('dbms'));
        
        if (!dbmsQuiz) {
            console.log('DBMS quiz not found.');
            return;
        }

        console.log(`Found DBMS quiz: ${dbmsQuiz.title} (ID: ${dbmsQuiz.id}). Updating academic year and semester...`);
        
        const { error: updateError } = await supabase.from('quizzes').update({
            academic_year: '1st Year',
            semester: 'Semester 1'
        }).eq('id', dbmsQuiz.id);
        
        if (updateError) {
            console.error('Error updating quiz:', updateError.message);
        } else {
            console.log('Quiz successfully updated to 1st Year, Semester 1.');
        }

    } catch (err) {
        console.error('Unexpected error:', err);
    }
};

run();
