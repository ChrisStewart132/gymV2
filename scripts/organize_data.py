'''
python script to organize the .json files for each exercise scraped via scrape.js
'''
import os
import json

def read_json_file(file_path):
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print("File not found.")
        return None
    except json.JSONDecodeError:
        print("Invalid JSON format.")
        return None

def get_json_files(directory):
    try:
        json_files = [os.path.join(directory, file) for file in os.listdir(directory) if file.endswith('.json')]
        return json_files
    except FileNotFoundError:
        print("Directory not found.")
        return None

def main():
    '''
    {'rhomboids', 'pectoralis minor', 'gluteus medius', 'erector spinae', 'supinator', 'biceps brachii', 'dumbbells',
      'teres minor', 'rectus abdominis', 'sissy squat bench', 'weight plate', 'gastrocnemius', 'stability ball',
        'posterior deltoid', 'suspension trainer', 'cable', 'obturator externus', 'compound', 'psoas major', 'pectineus', 
        'supraspinatus', 'olympic triceps bar', 'infraspinatus', 'dip belt', 'piriformis', 'trap bar', 'smith machine',
          'lateral deltoid', 'upper and middle trapezius', 'hip external rotators', 'roman chair', 'serratus anterior',
            'middle and lower trapezius', 'brachioradialis', 'upper pectoralis major', 'lower pectoralis major', 'iliopsoas',
              'popliteus', 'push', 'bodyweight', 'wrist flexors', 'adductor longus', 'wrist extensors', 'latissimus dorsi',
                'iliocastalis lumborum', 'sternocleidomastoid', 'triceps brachii', 'Ab Bench', 'iliocastalis thoracis',
                  'gluteus minimus', 'isolation', 'adductor brevis', 'ez curl bar', 'head harness', 'sartorius',
                    'rectus femoris', 'pull', 'kettlebell', 'anterior deltoid', 'tensor fasciae latae', 'pronators',
                      'splenius', 'quadratus lumborum', 'medicine ball', 'teres major', 'soleus', 'machine', 
                      'hamstrings', 't-bar', 'quadriceps', 'barbell', 'adductor magnus', 'brachialis', 'gracilis',
                        'levator scapulae', 'gluteus maximus', 'obliques', 'resistance band', 'landmine'}
    
    '''
    equipment = set([""])
    muscle_groups = set([])
    
    names = set()
    Target_muscles = set()
    Synergists = set()
    Mechanics = set()
    Forces = set()
    tags = set()
    
    DIRECTORY = "data\\scraped\\"
    for filename in os.listdir(DIRECTORY):
        filepath = os.path.join(DIRECTORY, filename)
        if os.path.isfile(filepath):
            try:
                json_data = read_json_file(filepath)

                names.add(json_data['name'])
                Forces.add(json_data['Force'])
                for term in json_data['Target muscle'].replace("(","").replace(")","").replace(",","").split():
                    Target_muscles.add(term)
                for term in json_data['Synergists'].replace("(","").replace(")","").replace(",","").split():
                    Synergists.add(term)   
                for tag in json_data['tags']:
                    tags.add(tag)
            except:
                pass
    print('\n"tags":', list(tags))
    print('\n"names":', list(names))
    print('\n"forces":',list(Forces))
    print('\n"target muscles":',list(Target_muscles))
    print('\n"synergists":',list(Synergists))

main()