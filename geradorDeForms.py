import os
import re
from pathlib import Path

def generate_form_from_template(template_path, output_path, config):
    """
    Generate a new form file from a template by replacing placeholders.
    
    Args:
        template_path: Path to the template file
        output_path: Path where the new file will be created
        config: Dictionary with replacement values
    """
    
    # Read the template file
    with open(template_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Perform replacements
    replacements = {
        # Model name (full text)
        r'const Modelo = "[^"]*"': f'const Modelo = "{config["modelo_nome"]}"',
        
        # Form component name
        r'const \w+Form = \(\) => \{': f'const {config["form_component"]} = () => {{',
        
        # Collection name
        r"const colecao = '[^']*';": f"const colecao = '{config["colecao"]}';",
        
        # Error message for file upload
        r'throw new Error\("É necessário realizar upload d[oa] [^"]*\."\)': 
            f'throw new Error("É necessário realizar upload {config["artigo"]} {config["modelo_nome"]}.")',
        
        # Observations field name
        r"name='obs_\w+'": f"name='obs_{config['obs_suffix']}'",
        
        # Observations placeholder text
        r"placeholder='Digite aqui informações relevantes sobre [^']*'":
            f"placeholder='Digite aqui informações relevantes sobre {config['artigo_demonstrativo']} {config['modelo_nome']} que não foram destacadas nos campos anteriores.'",
        
        # Export statement
        r'export default \w+Form;': f'export default {config["form_component"]};',
    }
    
    # Apply all replacements
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write the new file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ File generated: {output_path}")


def main():
    """
    Main function to generate multiple form files from configurations.
    """
    
    # Define the template file path
    template_path = "LAForm.jsx"  # Your original LA (Laudo) form
    
    # Define configurations for different forms
    forms_config = [
        {
            "modelo_nome": "Lista de Serviço",
            "form_component": "LSForm",
            "colecao": "lss",
            "artigo": "da",  # "da Lista de Serviço"
            "artigo_demonstrativo": "esta",  # "esta Lista de Serviço"
            "obs_suffix": "ls",
            "output_file": "LSForm.jsx"
        },
        {
            "modelo_nome": "Relatório Técnico",
            "form_component": "RTForm",
            "colecao": "rts",
            "artigo": "do",  # "do Relatório Técnico"
            "artigo_demonstrativo": "este",  # "este Relatório Técnico"
            "obs_suffix": "rt",
            "output_file": "RTForm.jsx"
        },
        {
            "modelo_nome": "Nota Técnica",
            "form_component": "NTForm",
            "colecao": "nts",
            "artigo": "da",  # "da Nota Técnica"
            "artigo_demonstrativo": "esta",  # "esta Nota Técnica"
            "obs_suffix": "nt",
            "output_file": "NTForm.jsx"
        },
        {
            "modelo_nome": "Parecer Técnico",
            "form_component": "PTForm",
            "colecao": "pts",
            "artigo": "do",  # "do Parecer Técnico"
            "artigo_demonstrativo": "este",  # "este Parecer Técnico"
            "obs_suffix": "pt",
            "output_file": "PTForm.jsx"
        },
        {
            "modelo_nome": "Memorial Descritivo",
            "form_component": "MDForm",
            "colecao": "mds",
            "artigo": "do",  # "do Memorial Descritivo"
            "artigo_demonstrativo": "este",  # "este Memorial Descritivo"
            "obs_suffix": "md",
            "output_file": "MDForm.jsx"
        },
    ]
    
    # Output directory
    output_dir = "generated_forms"
    
    # Check if template exists
    if not os.path.exists(template_path):
        print(f"❌ Error: Template file '{template_path}' not found!")
        print("Please make sure the LAForm.jsx file is in the same directory as this script.")
        return
    
    print(f"📄 Using template: {template_path}")
    print(f"📁 Output directory: {output_dir}\n")
    
    # Generate each form
    for config in forms_config:
        output_path = os.path.join(output_dir, config["output_file"])
        
        try:
            generate_form_from_template(template_path, output_path, config)
        except Exception as e:
            print(f"❌ Error generating {config['output_file']}: {str(e)}")
    
    print(f"\n✨ Generation complete! {len(forms_config)} files created in '{output_dir}' directory.")
    print("\n📋 Generated files:")
    for config in forms_config:
        print(f"   - {config['output_file']} ({config['modelo_nome']})")


if __name__ == "__main__":
    main()